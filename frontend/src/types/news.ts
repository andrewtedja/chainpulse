export interface Coin {
	ticker: string;
	name: string;
}

export interface News {
	id: number;
	title: string;
	content: string | null;
	published_at: string;
	sentiment_score: number | null;
	sentiment_label: "positive" | "neutral" | "negative" | null;
	created_at: string;
	url?: string;
	source?: string;
	coins: Coin[];
}

export interface NewsPagination {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}

export interface NewsResponse {
	data: News[];
	pagination: NewsPagination;
}
