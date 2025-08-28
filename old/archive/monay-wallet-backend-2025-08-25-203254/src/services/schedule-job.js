import loggers from './logger';
import repositories from '../repositories';

const { errorLogger } = loggers;
const { mediaRepository } = repositories;

export default {
    /**
     * test schedule
     */
    async test() {
        try {

            // await mediaRepository.test();
        } catch (error) {
            errorLogger.error(JSON.stringify(error));
        }
    },
    /**
     * delete media schedule
     */
    async deleteMedia() {
        try {
            await mediaRepository.findAllAndRemove();
        } catch (error) {
            errorLogger.error(JSON.stringify(error));
        }
    },
};
