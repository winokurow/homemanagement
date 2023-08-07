import {Response, Request} from "express";
import {db} from "./config/firebase";
import {firestore} from "firebase-admin";
import DocumentReference = firestore.DocumentReference;


type WeightObject = {
  category: string;
  weight: number;
}

type EventTemplate = {
  category: string;
  name: string;
  weight: number;
  durationInMinutes: number;
  weights: WeightObject[];
  postProcessing: string;
}

export const addEntry = async (req: Request, res: Response) => {
  try {
    const eventTemplateData = req.body as EventTemplate;
    // Write eventTemplateObject to Firestore
    const docRef: DocumentReference = await db.collection("event-templates").add(eventTemplateData);
    console.log(`------------------------------`);
    console.log(`Event Template created with ID: ${docRef.id}`);
    console.log(JSON.stringify(eventTemplateData));
    res.status(200).send(`Event Template created with ID: ${docRef.id}`);

  } catch (error) {
    console.error("Error creating Event Template:", error);
    res.status(500).send("Error creating Event Template");
  }
};
export const getAllEntries = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;

    // Query Firestore for EventTemplates with the specified category
    const snapshot = await db.collection("event-templates")
      .where("category", "==", category)
      .get();

    const eventTemplates: EventTemplate[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as EventTemplate;
      eventTemplates.push(data);
    });

    res.status(200).json(eventTemplates);
  } catch (error) {
    console.error("Error retrieving EventTemplates:", error);
    res.status(500).send("Error retrieving EventTemplates");
  }
};

/* const updateEntry = async (req: Request, res: Response) => {
    const { body: { text, title }, params: { entryId } } = req

    try {
        const entry = db.collection('entries').doc(entryId)
        const currentData = (await entry.get()).data() || {}

        const entryObject = {
            title: title || currentData.title,
            text: text || currentData.text,
        }

        await entry.set(entryObject).catch(error => {
            return res.status(400).json({
                status: 'error',
                message: error.message
            })
        })

        return res.status(200).json({
            status: 'success',
            message: 'entry updated successfully',
            data: entryObject
        })
    }
    catch(error) { return res.status(500).json(error.message) }
}

const deleteEntry = async (req: Request, res: Response) => {
    const { entryId } = req.params

    try {
        const entry = db.collection('entries').doc(entryId)

        await entry.delete().catch(error => {
            return res.status(400).json({
                status: 'error',
                message: error.message
            })
        })

        return res.status(200).json({
            status: 'success',
            message: 'entry deleted successfully',
        })
    }
    catch(error) { return res.status(500).json(error.message) }
} */
/* export { addEntry, getAllEntries, updateEntry, deleteEntry } */
