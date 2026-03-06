const express = require("express");
const Feedback = require("../models/Feedback.model");

const routerStatistics = express.Router();

routerStatistics.post("/", async (req, res) => {

	let { feedback } = req.body;

	let response = null;
	try {
		response = await fetch(process.env.USERS_SERVICE_URL + "/students/currentStudent", {
			method: "GET", headers: req.headers
		});
	}
	catch ( e ) {
		console.log("content: "+response);
		console.log(response);
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}

	try {
		let jsonData = await response.json();
		if ( response.ok ) {
			feedback.student = {
				studentId: jsonData.id, classroomId: jsonData.classroomId
			};
		} else {
			return res.status(404).json({ error: jsonData.error });
		}

		let feedbackRes = await Feedback.create(feedback);
		res.status(200).json(feedbackRes);
	}
	catch ( e ) {
		console.log("content: "+response);
                console.log(response);
		console.log(await response.json());
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

routerStatistics.get("/classroom/:classroomId", async (req, res) => {

	let classroomId = req.params.classroomId;
	const networkTypeOrder = ["I-I", "I-II", "I-III"];
	const representationOrder = ["ICONIC", "MIXED", "GLOBAL", "SYMBOLIC"];

	let feedbacks = null;

	try {
		feedbacks = await Feedback.find({ "student.classroomId": classroomId });
	} catch ( e ){
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}

	// Initialize grouped data with counts for both network types, training modes, and representations
	let groupedData = networkTypeOrder.reduce((acc, type) => {
		acc[type] = {
			representationCounts: {
				free: representationOrder.reduce((repAcc, rep) => {
					repAcc[rep] = 0;
					return repAcc;
				}, {}),
				ruled: representationOrder.reduce((repAcc, rep) => {
					repAcc[rep] = 0;
					return repAcc;
				}, {})
			}
		};
		return acc;
	}, {});

	// Group, count by networkType, trainingMode, and representation
	feedbacks.forEach((feedback) => {
		if (groupedData[feedback.networkType]) {
			const trainingMode = feedback.trainingMode || 'free'; // Default to free if not specified
			const representation = feedback.representation || 'ICONIC';
			if (groupedData[feedback.networkType].representationCounts[trainingMode] &&
				groupedData[feedback.networkType].representationCounts[trainingMode][representation] !== undefined) {
				groupedData[feedback.networkType].representationCounts[trainingMode][representation]++;
			}
		}
	});

	let totalFeedbacks = feedbacks.length;

	res.status(200).json({ groupedData, totalFeedbacks });
});

routerStatistics.get("/student/:studentId", async (req, res) => {
	let studentId = req.params.studentId;

	try {
		let feedbacks = await Feedback.find({ "student.studentId": studentId });

		const totalFeedbacks = feedbacks.length;

		// Initialize data structure for all representations with error breakdown
		let iconicErrors = {
			Lexical: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Syntactic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Semantic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 }
		};

		let mixedErrors = {
			Lexical: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Syntactic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Semantic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 }
		};

		let globalErrors = {
			Lexical: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Syntactic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Semantic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 }
		};

		let symbolicErrors = {
			Lexical: 0,
			Syntactic: 0,
			Semantic: 0
		};

		// Process feedbacks
		feedbacks.forEach((feedback) => {
			["phase1", "phase2"].forEach((phase) => {
				if (feedback[phase]) {
					const representation = feedback.representation || 'ICONIC';

					if (representation === "ICONIC") {
						iconicErrors.Lexical.incorrectOrder += feedback[phase].incorrectOrderLexical || 0;
						iconicErrors.Lexical.incorrectPos += feedback[phase].incorrectPosLexical || 0;
						iconicErrors.Lexical.outOfBounds += feedback[phase].outOfBoundsLexical || 0;

						iconicErrors.Syntactic.incorrectOrder += feedback[phase].incorrectOrderSintactic || 0;
						iconicErrors.Syntactic.incorrectPos += feedback[phase].incorrectPosSintactic || 0;
						iconicErrors.Syntactic.outOfBounds += feedback[phase].outOfBoundsSintactic || 0;

						iconicErrors.Semantic.incorrectOrder += feedback[phase].incorrectOrderSemantic || 0;
						iconicErrors.Semantic.incorrectPos += feedback[phase].incorrectPosSemantic || 0;
						iconicErrors.Semantic.outOfBounds += feedback[phase].outOfBoundsSemantic || 0;
					} else if (representation === "MIXED") {
						mixedErrors.Lexical.incorrectOrder += feedback[phase].incorrectOrderLexical || 0;
						mixedErrors.Lexical.incorrectPos += feedback[phase].incorrectPosLexical || 0;
						mixedErrors.Lexical.outOfBounds += feedback[phase].outOfBoundsLexical || 0;

						mixedErrors.Syntactic.incorrectOrder += feedback[phase].incorrectOrderSintactic || 0;
						mixedErrors.Syntactic.incorrectPos += feedback[phase].incorrectPosSintactic || 0;
						mixedErrors.Syntactic.outOfBounds += feedback[phase].outOfBoundsSintactic || 0;

						mixedErrors.Semantic.incorrectOrder += feedback[phase].incorrectOrderSemantic || 0;
						mixedErrors.Semantic.incorrectPos += feedback[phase].incorrectPosSemantic || 0;
						mixedErrors.Semantic.outOfBounds += feedback[phase].outOfBoundsSemantic || 0;
					} else if (representation === "GLOBAL") {
						globalErrors.Lexical.incorrectOrder += feedback[phase].incorrectOrderLexical || 0;
						globalErrors.Lexical.incorrectPos += feedback[phase].incorrectPosLexical || 0;
						globalErrors.Lexical.outOfBounds += feedback[phase].outOfBoundsLexical || 0;

						globalErrors.Syntactic.incorrectOrder += feedback[phase].incorrectOrderSintactic || 0;
						globalErrors.Syntactic.incorrectPos += feedback[phase].incorrectPosSintactic || 0;
						globalErrors.Syntactic.outOfBounds += feedback[phase].outOfBoundsSintactic || 0;

						globalErrors.Semantic.incorrectOrder += feedback[phase].incorrectOrderSemantic || 0;
						globalErrors.Semantic.incorrectPos += feedback[phase].incorrectPosSemantic || 0;
						globalErrors.Semantic.outOfBounds += feedback[phase].outOfBoundsSemantic || 0;
					} else if (representation === "SYMBOLIC") {
						symbolicErrors.Lexical += feedback[phase].lexicalError || 0;
						symbolicErrors.Syntactic += feedback[phase].syntacticError || 0;
						symbolicErrors.Semantic += feedback[phase].semanticError || 0;
					}
				}
			});
		});

		// Calculate totals and percentages
		const calculatePercentages = (errors) => {
			const total = Object.values(errors).reduce((sum, errorType) => {
				if (typeof errorType === 'object') {
					return sum + Object.values(errorType).reduce((s, v) => s + v, 0);
				}
				return sum + errorType;
			}, 0);

			const result = {};
			Object.keys(errors).forEach(errorType => {
				if (typeof errors[errorType] === 'object') {
					result[errorType] = {};
					Object.keys(errors[errorType]).forEach(errorSubType => {
						const count = errors[errorType][errorSubType];
						result[errorType][errorSubType] = {
							count: count,
							percentage: total > 0 ? ((count / total) * 100).toFixed(2) : "0.00"
						};
					});
				} else {
					const count = errors[errorType];
					result[errorType] = {
						count: count,
						percentage: total > 0 ? ((count / total) * 100).toFixed(2) : "0.00"
					};
				}
			});
			return { result, total };
		};

		const { result: iconicErrorsProcessed, total: iconicErrorsTotal } = calculatePercentages(iconicErrors);
		const { result: mixedErrorsProcessed, total: mixedErrorsTotal } = calculatePercentages(mixedErrors);
		const { result: symbolicErrorsProcessed, total: symbolicErrorsTotal } = calculatePercentages(symbolicErrors);
		const { result: globalErrorsProcessed, total: globalErrorsTotal } = calculatePercentages(globalErrors);

		// Calculate representation percentages
		const percentageLexicalIconic = iconicErrorsTotal > 0 ? ((
			(iconicErrors.Lexical.incorrectOrder + iconicErrors.Lexical.incorrectPos + iconicErrors.Lexical.outOfBounds) / iconicErrorsTotal
		) * 100).toFixed(2) : "0.00";

		const percentageSyntacticIconic = iconicErrorsTotal > 0 ? ((
			(iconicErrors.Syntactic.incorrectOrder + iconicErrors.Syntactic.incorrectPos + iconicErrors.Syntactic.outOfBounds) / iconicErrorsTotal
		) * 100).toFixed(2) : "0.00";

		const percentageSemanticIconic = iconicErrorsTotal > 0 ? ((
			(iconicErrors.Semantic.incorrectOrder + iconicErrors.Semantic.incorrectPos + iconicErrors.Semantic.outOfBounds) / iconicErrorsTotal
		) * 100).toFixed(2) : "0.00";

		const percentageLexicalMixed = mixedErrorsTotal > 0 ? ((
			(mixedErrors.Lexical.incorrectOrder + mixedErrors.Lexical.incorrectPos + mixedErrors.Lexical.outOfBounds) / mixedErrorsTotal
		) * 100).toFixed(2) : "0.00";

		const percentageSyntacticMixed = mixedErrorsTotal > 0 ? ((
			(mixedErrors.Syntactic.incorrectOrder + mixedErrors.Syntactic.incorrectPos + mixedErrors.Syntactic.outOfBounds) / mixedErrorsTotal
		) * 100).toFixed(2) : "0.00";

		const percentageSemanticMixed = mixedErrorsTotal > 0 ? ((
			(mixedErrors.Semantic.incorrectOrder + mixedErrors.Semantic.incorrectPos + mixedErrors.Semantic.outOfBounds) / mixedErrorsTotal
		) * 100).toFixed(2) : "0.00";

		res.status(200).json({
			iconicErrors: iconicErrorsProcessed,
			mixedErrors: mixedErrorsProcessed,
			symbolicErrors: symbolicErrorsProcessed,
			globalErrors: globalErrorsProcessed,
			percentageLexicalIconic,
			percentageSyntacticIconic,
			percentageSemanticIconic,
			percentageLexicalMixed,
			percentageSyntacticMixed,
			percentageSemanticMixed,
			totalFeedbacks,
			iconicErrorsTotal,
			mixedErrorsTotal,
			symbolicErrorsTotal,
			globalErrorsTotal
		});
	}
	catch ( e ) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

module.exports = routerStatistics;
