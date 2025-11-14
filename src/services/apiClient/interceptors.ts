// Espacio para futuros interceptores (logging, tracing, retry). Mantener simple por ahora.
export type RequestInterceptor = (input: RequestInfo, init: RequestInit) => Promise<[RequestInfo, RequestInit]> | [RequestInfo, RequestInit];
export type ResponseInterceptor = (response: Response) => Promise<Response> | Response;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export function addRequestInterceptor(i: RequestInterceptor) { requestInterceptors.push(i); }
export function addResponseInterceptor(i: ResponseInterceptor) { responseInterceptors.push(i); }

export async function runRequestInterceptors(input: RequestInfo, init: RequestInit): Promise<[RequestInfo, RequestInit]> {
  let req: [RequestInfo, RequestInit] = [input, init];
  for (const i of requestInterceptors) {
    req = await i(req[0], req[1]);
  }
  return req;
}

export async function runResponseInterceptors(res: Response): Promise<Response> {
  let r = res;
  for (const i of responseInterceptors) {
    r = await i(r);
  }
  return r;
}
