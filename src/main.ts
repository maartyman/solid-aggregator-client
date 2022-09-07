import {loggerSettings} from "./utils/loggerSettings";
import {Logger} from "tslog";

new Logger(loggerSettings).info("Hello world!");
