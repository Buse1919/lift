import chalk from "chalk";
import { log } from "@serverless/utils/log";

export let isV3 = false;

export function weAreInV3(): void {
    isV3 = true;
}

export function legacyLog(message: string): void {
    console.log("Lift: " + chalk.yellow(message));
}

export function debug(message: string): void {
    if (isV3) {
        log.get("lift").debug(message);
    } else {
        if (process.env.SLS_DEBUG !== undefined) {
            console.log(chalk.gray("Lift: " + message));
        }
    }
}
