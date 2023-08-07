import {auth} from "firebase-admin";

declare global{
  namespace Express {
    import DecodedIdToken = auth.DecodedIdToken;

    interface Request {
      currentUser:  DecodedIdToken
    }
  }
}

