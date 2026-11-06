const request = require("supertest");
const express = require("express");
const routerStatistics = require("../../routers/routerStatistics");
const Feedback = require("../../models/Feedback.model");

jest.mock("../../models/Feedback.model");

const app = express();
app.use(express.json());
app.use("/statistics", routerStatistics);
const originalFetch = global.fetch;

describe("Feedback export routes", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch = jest.fn();
	});

	afterAll(() => {
		global.fetch = originalFetch;
	});

	it("returns classroom feedback with the student name after confirming classroom ownership", async () => {
		global.fetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 12, name: "Clase A" }]
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 4, name: "Ana", lastName: "Pérez" }]
			});
		Feedback.find.mockResolvedValue([
			{ title: "Ejercicio", student: { studentId: 4, classroomId: 12 } }
		]);

		const response = await request(app)
			.get("/statistics/export/classroom/12")
			.set("Authorization", "Bearer teacher-token");

		expect(response.status).toBe(200);
		expect(response.body.name).toBe("Clase A");
		expect(response.body.feedbacks[0].studentName).toBe("Ana Pérez");
		expect(global.fetch).toHaveBeenNthCalledWith(1, expect.stringContaining("/classrooms/list"), expect.objectContaining({
			headers: { Authorization: "Bearer teacher-token" }
		}));
		expect(Feedback.find).toHaveBeenCalledWith({ "student.classroomId": "12" });
	});

	it("does not export a classroom that is not owned by the teacher", async () => {
		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => [{ id: 7, name: "Otra clase" }]
		});

		const response = await request(app)
			.get("/statistics/export/classroom/12")
			.set("Authorization", "Bearer teacher-token");

		expect(response.status).toBe(404);
		expect(Feedback.find).not.toHaveBeenCalled();
	});

	it("returns student feedback only after the users service authorizes that student", async () => {
		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: 4, name: "Ana", lastName: "Pérez" })
		});
		Feedback.find.mockResolvedValue([{ title: "Ejercicio", student: { studentId: 4 } }]);

		const response = await request(app)
			.get("/statistics/export/student/4")
			.set("Authorization", "Bearer teacher-token");

		expect(response.status).toBe(200);
		expect(response.body.name).toBe("Ana Pérez");
		expect(response.body.feedbacks).toHaveLength(1);
		expect(Feedback.find).toHaveBeenCalledWith({ "student.studentId": "4" });
	});

	it("does not return student feedback when the users service rejects access", async () => {
		global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });

		const response = await request(app)
			.get("/statistics/export/student/4")
			.set("Authorization", "Bearer teacher-token");

		expect(response.status).toBe(404);
		expect(Feedback.find).not.toHaveBeenCalled();
	});
});
