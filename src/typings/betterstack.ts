export type BetterStackResourceStatus = "operational" | "downtime" | "degraded" | "maintenance" | "resolved";
export type BetterStackAffectedResourceStatus = "resolved" | "degraded" | "downtime" | "maintenance";

export interface BetterStackIndexResponse {
	data: {
		id: string;
		type: "status_page";
		attributes: {
			company_name: string;
			company_url: string;
			contact_url: string;
			logo_url: string;
			timezone: string;
			subdomain: string;
			custom_domain: string;
			announcement?: string;
			aggregate_state: Exclude<BetterStackResourceStatus, "resolved">;
			created_at: string;
			updated_at: string;
		};
		relationships: {
			sections: {
				data: {
					id: string;
					type: "section";
				}[];
			};
			resources: {
				data: {
					id: string;
					type: "status_page_resource";
				}[];
			};
			status_reports: {
				data: {
					id: string;
					type: "status_report";
				}[];
			};
		};
	};
	included: BetterStackIncludedItem[];
}

export type BetterStackIncludedItem =
	| BetterStackStatusPageSection
	| BetterStackStatusPageResource
	| BetterStackStatusUpdate
	| BetterStackStatusReport;

export interface BetterStackAffectedResource {
	status_page_resource_id: string;
	status: BetterStackAffectedResourceStatus;
}

export interface BetterStackStatusPageSection {
	id: string;
	type: "status_page_section";
	attributes: {
		name: string;
		position: number;
	};
}

export interface BetterStackStatusPageResource {
	id: string;
	type: "status_page_resource";
	attributes: {
		status_page_section_id: number;
		resource_id: number;
		resource_type: string;
		public_name: string;
		explanation: string;
		position: number;
		availability: number;
		status: BetterStackResourceStatus;
		status_history: {
			day: string;
			status: BetterStackResourceStatus;
			downtime_duration: number;
			maintenance_duration: number;
		}[];
	};
}

export interface BetterStackStatusUpdate {
	id: string;
	type: "status_update";
	attributes: {
		message: string;
		published_at: string;
		published_at_timezone: string | null;
		notify_subscribers: boolean;
		affected_resources: BetterStackAffectedResource[];
	};
}

export interface BetterStackStatusReport {
	id: string;
	type: "status_report";
	attributes: {
		title: string;
		report_type: "manual" | "automatic" | "maintenance";
		starts_at: string;
		ends_at: string | null;
		affected_resources: BetterStackAffectedResource[];
		aggregate_state: BetterStackResourceStatus;
	};
	relationships: {
		status_updates: {
			data: {
				id: string;
				type: "status_update";
			}[];
		};
	};
}
