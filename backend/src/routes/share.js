const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Generate a shareable link for an itinerary
 * POST /api/share/generate-link
 */
router.post('/generate-link', authenticateUser, async (req, res) => {
  try {
    const { itineraryId, permissions = 'read', expiresInDays = 30 } = req.body;

    // Verify the user owns the itinerary
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id: parseInt(itineraryId),
        userId: req.user.userId
      }
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found or you do not have permission' });
    }

    // Generate a unique share token
    const shareToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create share record in database
    const share = await prisma.itineraryShare.create({
      data: {
        shareToken,
        itineraryId: parseInt(itineraryId),
        createdById: req.user.userId,
        permissions,
        expiresAt,
        isActive: true
      }
    });

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareToken}`;

    res.json({
      success: true,
      shareToken,
      shareUrl,
      permissions,
      expiresAt,
      message: 'Shareable link created successfully'
    });

  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ error: 'Failed to generate shareable link' });
  }
});

/**
 * Get shared itinerary by token
 * GET /api/share/:token
 */
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find the share record
    const share = await prisma.itineraryShare.findFirst({
      where: {
        shareToken: token,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        itinerary: {
          include: {
            days: {
              include: {
                activities: true,
                meals: true
              },
              orderBy: {
                dayNumber: 'asc'
              }
            },
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!share) {
      return res.status(404).json({ error: 'Shared itinerary not found or expired' });
    }

    // Remove sensitive user data
    const { itinerary } = share;
    const sanitizedItinerary = {
      ...itinerary,
      user: {
        name: itinerary.user.name || 'Anonymous'
      }
    };

    res.json({
      success: true,
      itinerary: sanitizedItinerary,
      shareInfo: {
        permissions: share.permissions,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
        sharedBy: share.createdBy.name || 'Anonymous'
      }
    });

  } catch (error) {
    console.error('Error fetching shared itinerary:', error);
    res.status(500).json({ error: 'Failed to fetch shared itinerary' });
  }
});

/**
 * Get all shares created by the user
 * GET /api/share/my-shares
 */
router.get('/my-shares', authenticateUser, async (req, res) => {
  try {
    const shares = await prisma.itineraryShare.findMany({
      where: {
        createdById: req.user.userId
      },
      include: {
        itinerary: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const shareList = shares.map(share => ({
      id: share.id,
      shareToken: share.shareToken,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${share.shareToken}`,
      permissions: share.permissions,
      isActive: share.isActive,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
      itinerary: share.itinerary
    }));

    res.json({
      success: true,
      shares: shareList
    });

  } catch (error) {
    console.error('Error fetching user shares:', error);
    res.status(500).json({ error: 'Failed to fetch shares' });
  }
});

/**
 * Revoke a share (deactivate)
 * DELETE /api/share/:shareId
 */
router.delete('/:shareId', authenticateUser, async (req, res) => {
  try {
    const { shareId } = req.params;

    // Verify the user owns this share
    const share = await prisma.itineraryShare.findFirst({
      where: {
        id: parseInt(shareId),
        createdById: req.user.userId
      }
    });

    if (!share) {
      return res.status(404).json({ error: 'Share not found or you do not have permission' });
    }

    // Deactivate the share
    await prisma.itineraryShare.update({
      where: {
        id: parseInt(shareId)
      },
      data: {
        isActive: false
      }
    });

    res.json({
      success: true,
      message: 'Share revoked successfully'
    });

  } catch (error) {
    console.error('Error revoking share:', error);
    res.status(500).json({ error: 'Failed to revoke share' });
  }
});

/**
 * Update share permissions or expiration
 * PUT /api/share/:shareId
 */
router.put('/:shareId', authenticateUser, async (req, res) => {
  try {
    const { shareId } = req.params;
    const { permissions, expiresInDays } = req.body;

    // Verify the user owns this share
    const share = await prisma.itineraryShare.findFirst({
      where: {
        id: parseInt(shareId),
        createdById: req.user.userId
      }
    });

    if (!share) {
      return res.status(404).json({ error: 'Share not found or you do not have permission' });
    }

    const updateData = {};
    
    if (permissions) {
      updateData.permissions = permissions;
    }
    
    if (expiresInDays) {
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + expiresInDays);
      updateData.expiresAt = newExpiresAt;
    }

    const updatedShare = await prisma.itineraryShare.update({
      where: {
        id: parseInt(shareId)
      },
      data: updateData
    });

    res.json({
      success: true,
      share: updatedShare,
      message: 'Share updated successfully'
    });

  } catch (error) {
    console.error('Error updating share:', error);
    res.status(500).json({ error: 'Failed to update share' });
  }
});

/**
 * Add collaborator to an itinerary (for collaborative features)
 * POST /api/share/add-collaborator
 */
router.post('/add-collaborator', authenticateUser, async (req, res) => {
  try {
    const { itineraryId, email, permissions = 'edit' } = req.body;

    // Verify the user owns the itinerary
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id: parseInt(itineraryId),
        userId: req.user.userId
      }
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found or you do not have permission' });
    }

    // Find the user to add as collaborator
    const collaboratorUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!collaboratorUser) {
      return res.status(404).json({ error: 'User with this email not found' });
    }

    // Check if already a collaborator
    const existingCollaborator = await prisma.itineraryCollaborator.findFirst({
      where: {
        itineraryId: parseInt(itineraryId),
        userId: collaboratorUser.id
      }
    });

    if (existingCollaborator) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    // Add collaborator
    const collaborator = await prisma.itineraryCollaborator.create({
      data: {
        itineraryId: parseInt(itineraryId),
        userId: collaboratorUser.id,
        permissions,
        addedById: req.user.userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      collaborator,
      message: 'Collaborator added successfully'
    });

  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

/**
 * Get collaborators for an itinerary
 * GET /api/share/collaborators/:itineraryId
 */
router.get('/collaborators/:itineraryId', authenticateUser, async (req, res) => {
  try {
    const { itineraryId } = req.params;

    // Verify the user has access to this itinerary
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id: parseInt(itineraryId),
        OR: [
          { userId: req.user.userId },
          {
            collaborators: {
              some: {
                userId: req.user.userId
              }
            }
          }
        ]
      }
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found or you do not have permission' });
    }

    const collaborators = await prisma.itineraryCollaborator.findMany({
      where: {
        itineraryId: parseInt(itineraryId)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        addedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      collaborators
    });

  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

module.exports = router;