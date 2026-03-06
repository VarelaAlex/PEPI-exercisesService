let mongoose = require('mongoose');

let FeedbackSchema = mongoose.Schema({
    title: {
        type: String,
    },
    representation: {
        type: String,
    },
    networkType: {
        type: String,
    },
    trainingMode: {
        type: String,
        enum: ['free', 'ruled']
    },
    date: {
        type: Date
    },
    phase1: {
        elapsedTime: {
            type: Number,
        },
        incorrectOrderSintactic: {
            type: Number,
        },
        incorrectOrderSemantic: {
            type: Number,
        },
        incorrectOrderLexical: {
            type: Number,
        },
        incorrectPosSintactic: {
            type: Number,
        },
        incorrectPosSemantic: {
            type: Number,
        },
        incorrectPosLexical: {
            type: Number,
        },
        outOfBoundsSintactic: {
            type: Number,
        },
        outOfBoundsSemantic: {
            type: Number,
        },
        outOfBoundsLexical: {
            type: Number,
        },
        lexicalError: {
            type: Number
        },
        syntacticError: {
            type: Number
        },
        semanticError: {
            type: Number
        },
        orderError:{
            type: Number
        }
    },
    phase2: {
        elapsedTime: {
            type: Number,
        },
        incorrectOrderSintactic: {
            type: Number,
        },
        incorrectOrderSemantic: {
            type: Number,
        },
        incorrectOrderLexical: {
            type: Number,
        },
        incorrectPosSintactic: {
            type: Number,
        },
        incorrectPosSemantic: {
            type: Number,
        },
        incorrectPosLexical: {
            type: Number,
        },
        outOfBoundsSintactic: {
            type: Number,
        },
        outOfBoundsSemantic: {
            type: Number,
        },
        outOfBoundsLexical: {
            type: Number,
        },
        lexicalError: {
            type: Number
        },
        syntacticError: {
            type: Number
        },
        semanticError: {
            type: Number
        },
        orderError:{
            type: Number
        }
    },
    student: {
        studentId: {
            type: Number,
        },
        classroomId: {
            type: Number,
        }
    }
});
let Feedback = mongoose.model("Feedback", FeedbackSchema);

module.exports = Feedback;