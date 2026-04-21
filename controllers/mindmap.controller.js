const MindMap  = require('../models/Mindmap.model');
const Subject  = require('../models/Subject.model');
const Note     = require('../models/Note.model');
const { AppError } = require('../middleware/errorHandler');

// ── POST /mindmaps/generate ########################################################
const generateMindMap = async (req, res, next) => {
  try {
    const { subjectId } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) return next(new AppError('Subject not found.', 404, 'NOT_FOUND'));
    if (subject.userId.toString() !== req.user.userId) {
      return next(new AppError('Access forbidden.', 403, 'FORBIDDEN'));
    }

    const readyNotes = await Note.find({ subjectId, status: 'ready' });
    if (readyNotes.length === 0) {
      return next(new AppError('No ready notes available to generate a mind map from.', 422, 'NO_CONTENT'));
    }

    // ── AI call placeholder ########################################################
    // const { nodes, edges } = await callAI_generateMindMap(readyNotes);
    const nodes = [
      { label: subject.name, parentId: null },
      { label: 'Key Concept 1', parentId: null },
      { label: 'Key Concept 2', parentId: null }
    ];
    const edges = [
      { from: 'node-0', to: 'node-1', relation: 'includes' },
      { from: 'node-0', to: 'node-2', relation: 'includes' }
    ];
    //############################################################################

    const mindMap = await MindMap.create({
      userId: req.user.userId,
      subjectId,
      title: `${subject.name} – Mind Map`,
      nodes,
      edges
    });

    res.status(201).json({
      mindMapId: mindMap._id,
      title:     mindMap.title,
      nodes:     mindMap.nodes.map(n => ({ id: n._id, label: n.label, parentId: n.parentId })),
      edges:     mindMap.edges.map(e => ({ from: e.from, to: e.to, relation: e.relation }))
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /mindmaps/:mindMapId ########################################################
const getMindMap = async (req, res, next) => {
  try {
    const m = req.resource;
    res.status(200).json({
      mindMapId: m._id,
      title:     m.title,
      nodes:     m.nodes.map(n => ({ id: n._id, label: n.label, parentId: n.parentId })),
      edges:     m.edges
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateMindMap, getMindMap };
