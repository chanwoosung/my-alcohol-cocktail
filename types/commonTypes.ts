export type ServerComponentProps = {
	params:Params;
	searchParams: SearchParams;
};

export type Params = Promise<{ slug: string }>
export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>