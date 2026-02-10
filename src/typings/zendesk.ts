// https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#json-format
export interface ZendeskCreateTicketRequest {
	subject?: string;
	comment: {
		html_body: string;
		uploads?: string[];
	};
	requester: {
		email: string;
		name: string;
	};
	tags?: string[];
}

export interface ZendeskCreateTicketResponse {
	ticket: {
		assignee_id: number;
		collaborator_ids: number[];
		created_at: string;
		custom_fields: { id: number; value: string }[];
		custom_status_id: number;
		description: string;
		due_at: string;
		external_id: string;
		follower_ids: number[];
		from_messaging_channel: boolean;
		group_id: number;
		id: number;
		organization_id: number;
		priority: string;
		problem_id: number;
		raw_subject: string;
		recipient: string;
		requester_id: number;
		satisfaction_rating: {
			comment: string;
			id: number;
			score: string;
		};
		sharing_agreement_ids: number[];
		status: string;
		subject: string;
		tags: string[];
		updated_at: string;
		url: string;
		via: {
			channel: string;
		};
	};
}

export interface ZendeskAttachment {
	content_type: string;
	content_url: string;
	file_name: string;
	id: string;
	url: string;
}

export interface ZendeskUploadResponse {
	upload: {
		attachment: ZendeskAttachment;
		attachments: ZendeskAttachment[];
		expires_at: string;
		token: string;
	};
}
