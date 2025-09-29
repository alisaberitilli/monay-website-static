import repositories from '../repositories/index.js';

const { mediaRepository } = repositories;

export default {
    /**
     * test schedule
     */
    async test() {
        try {

            // await mediaRepository.test();
        } catch (error) {
            console.error('Schedule job error:', error);
        }
    },
    /**
     * delete media schedule
     */
    async deleteMedia() {
        try {
            await mediaRepository.findAllAndRemove();
        } catch (error) {
            console.error('Delete media error:', error);
        }
    },
};
