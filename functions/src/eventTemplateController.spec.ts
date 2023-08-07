import {Request, Response} from "express";
import {db} from "./config/firebase";
import {addEntry, getAllEntries} from "./eventTemplateController";

const req: Request = { body: {}, query: {} } as Request;
const res: Response = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
} as any;

// Mock the Firebase Firestore collection and document methods
const addMock = jest.fn();
const whereMock = jest.fn();
jest.mock("./config/firebase", () => ({
  db: {
    collection: () => ({
      add: addMock,
      where: whereMock,
    }),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("addEntry", () => {
  it("should add an entry to the Firestore collection and return success", async () => {
    const eventTemplateData = {
      category: "test_category",
      name: "Test Event",
      weight: 5,
      durationInMinutes: 60,
      weights: [],
      postProcessing: "Some post-processing data",
    };

    req.body = eventTemplateData;

    addMock.mockResolvedValue({ id: "some-id" });
    jest.spyOn(db, 'collection');
    await addEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Event Template created with ID: some-id");
    expect(addMock).toHaveBeenCalledWith(eventTemplateData);
    expect(db.collection).toHaveBeenCalledWith("event-templates");
  });

  it("should return 500 status when there is an error", async () => {
    req.body = {
      category: "test_category",
      name: "Test Event",
      weight: 5,
      durationInMinutes: 60,
      weights: [],
      postProcessing: "Some post-processing data",
    };

    // Mocking an error being thrown by db.collection().add()
    //(db.collection("event-templates").add as jest.Mocked<any>).mockRejectedValueOnce(new Error("Firestore Error"));

    (db.collection as jest.Mocked<any>).mockRejectedValueOnce({
      add: (new Error("Firestore Error")),
    });

    await addEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Error creating Event Template");
  });
});

describe("getAllEntries", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve event templates with the specified category and respond with the result", async () => {
    const category = "test_category";
    const eventTemplate1 = { category, name: "Event 1", weight: 5 };
    const eventTemplate2 = { category, name: "Event 2", weight: 3 };

    req.query.category = category;
    const snapshot = {
      forEach: jest.fn((callback: any) => {
        callback({ data: () => eventTemplate1 });
        callback({ data: () => eventTemplate2 });
      }),
    };
    whereMock.mockReturnValue({
      get: jest.fn().mockResolvedValue(snapshot),
    });
    addMock.mockResolvedValue({ id: "some-id" });
    jest.spyOn(db, 'collection');
    await getAllEntries(req, res);

    expect(req.query.category).toBe(category);
    expect(db.collection).toHaveBeenCalledWith("event-templates");
    expect(db.collection("event-templates").where).toHaveBeenCalledWith(
      "category",
      "==",
      category
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([eventTemplate1, eventTemplate2]);
  });
  it("should handle errors and respond with a 500 status code", async () => {
    const category = "test_category";
    req.query.category = category;
    const errorMessage = "Test error message";
    whereMock.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error(errorMessage)),
    });

    await getAllEntries(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Error retrieving EventTemplates");
  });
});