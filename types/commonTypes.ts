export type ServerComponentProps = {
	params:Params;
	searchParams: SearchParams;
};

export type Params = Promise<{ id: string }>
export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>