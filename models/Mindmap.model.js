const mongoose = require('mongoose');

const mindMapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, default: 'Mind Map' },
    nodes: [{
        label: { type: String, required: true },
        parentId: { type: String, default: null }
    }],
    edges: [{
        from: { type: String, required: true },
        to: { type: String, required: true },
        relation: { type: String, default: '' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('MindMap', mindMapSchema);