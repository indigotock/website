export class CommandFailure {
    reason: string
}
export interface CommandResult {
    output: string
    outputHeading?: string
    outputSubheading?: string
    failure?: CommandFailure
}