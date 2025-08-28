import ejs from 'ejs';
import path from 'path';

export default {
  /**
   * Generate templates
   * @param {object} model
   * @param {object} rules
   * @param {array} errors
   */
  generateEjsTemplate(req, callback) {
    const ejs_file_path = path.join(__dirname, `../ejs/${req.template}`);
    ejs.renderFile(ejs_file_path, { data: req.data }, (err, result) => {
      // render on success
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  },
};
