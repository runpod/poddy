import ExtendedClient from "../lib/extensions/ExtendedClient.js";
import PoddyFunctions from "./utilities/functions.js";

export class PoddyClient extends ExtendedClient {
	override get functions(): PoddyFunctions {
		return new PoddyFunctions(this);
	}
}
