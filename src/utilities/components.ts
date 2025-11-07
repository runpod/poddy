import {
	type APIActionRowComponent,
	type APIButtonComponent,
	type APIMessageTopLevelComponent,
	ButtonStyle,
	ComponentType,
} from "discord-api-types/v10";
import type Language from "../../lib/classes/Language.js";

export function getRunpodAccountLinkSection(language: Language, loginUrl: string): APIMessageTopLevelComponent {
	return {
		type: ComponentType.Section,
		components: [
			{
				type: ComponentType.TextDisplay,
				content: language.get("RUNPOD_HELP_US_HELP_YOU"),
			},
		],
		accessory: {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: language.get("RUNPOD_LINK_ACCOUNT_BUTTON_LABEL"),
			url: loginUrl,
		},
	};
}

export function getAskLinkButtonRow(
	language: Language,
	targetUserId: string,
	disabled = false,
): APIActionRowComponent<APIButtonComponent> {
	return {
		type: ComponentType.ActionRow,
		components: [
			{
				type: ComponentType.Button,
				style: ButtonStyle.Primary,
				label: language.get("RUNPOD_ASK_TO_LINK_BUTTON_LABEL"),
				custom_id: `askLink.${targetUserId}`,
				disabled,
			},
		],
	};
}
