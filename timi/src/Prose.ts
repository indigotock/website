

import { CommandFailReason } from "./Game";

export const FAILURE_QUOTES = {
    [CommandFailReason.AlreadyTakenItem]: [
        "You already have that."
    ],
    [CommandFailReason.UnknownVerb]: [
        "Sorry, I didn't understand that.",
        "I don't know what that means.",
        "Does not compute.",
        "What are you trying to say?",
        "If you're struggling, try 'help'.",
        "Come again?",
        "Pardon?",
        "I didn't quite catch that.",
    ],
    [CommandFailReason.CannotTake]: [
        "You cannot take the THING.",
        "The THING cannot be picked up.",
        "Can't take that."
    ],
    [CommandFailReason.CannotMove]: [
        "You cannot move the THING.",
        "The THING cannot be moved.",
        "Can't move that."
    ],
    [CommandFailReason.UnknownThing]: [
        "You can't VERB to the THING.",
        "You don't know what that is.",
        "What is a THING?",
        "There is no THING here.",
        "What is it you are looking for?"
    ],
    [CommandFailReason.NoTarget]: [
        "What do you want to do that to?",
        "You can't do that to nothing.",
        "You can't VERB thin air.",
        "You should try to target something.",
        "Need a thing to do that to."
    ],
    [CommandFailReason.CannotOpen]: [
        "The THING is already open.",
    ],
    [CommandFailReason.CannotPutInThing]: [
        "Can't put THING in that",
    ],
    [CommandFailReason.CannotClose]: [
        "The THING is already closed.",
    ],
    [CommandFailReason.CannotPutInSelf]: [
        "You can't put something into itself",
        "You can't put THING into itself",
    ]
}

export const TAKE_ITEM_QUOTES = ['You take the THING.',
                                 'You slip the THING into your rucksack.',
                                 `You take the THING, placing it into your rucksack.`]