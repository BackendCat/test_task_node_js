import { stopIfNotExists } from "../../config";


stopIfNotExists(['JWT_SECRET']);
const JWT_SECRET = process.env.JWT_SECRET as string;


export default JWT_SECRET;
