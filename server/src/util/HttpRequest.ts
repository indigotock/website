import debugx = require('debug')
var debug = debugx('site:models')

export type HttpRequestCallback<T> = (response: HttpRequestResponse<T>) => void
export interface HttpRequestResponse<T> {
    error: Error,
    body: T,
}