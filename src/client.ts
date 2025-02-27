import ExtendedClient from "../lib/extensions/ExtendedClient.js";
import type PoddyFunctions from "./utilities/functions";

export class PoddyClient extends ExtendedClient {
	override get functions(): PoddyFunctions {
		return super.functions as PoddyFunctions;
	}
}
