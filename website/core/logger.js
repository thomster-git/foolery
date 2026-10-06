export default class Logger {

    static info(message) {

        console.log(`ℹ ${message}`);

    }

    static success(message) {

        console.log(`✓ ${message}`);

    }

    static warning(message) {

        console.log(`⚠ ${message}`);

    }

    static error(message) {

        console.log(`✖ ${message}`);

    }

}
