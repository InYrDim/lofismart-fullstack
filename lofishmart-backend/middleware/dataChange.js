const featureController = require('../controllers/featureController');

let config = null;
let table = [];

module.exports = async (table_watch, action, data, attachment) => {
  try {
    if (config === null) {
      console.log('Mencari data watch table from config');
      const searchConfig = await featureController.configGet(1);
      if (searchConfig) {
        config = searchConfig;
        table = config.cat_app.data_watch.table;
      } else {
        const error = new Error("Config not configurate before..");
        throw error;
      }
    }

    if (table_watch) {

      const hasWatchingTable = table.includes(table_watch);

      if (hasWatchingTable) {
        if (action == 'INSERT') {  
          await featureController.dataChangeCreate(config.profile.id, table_watch, 'INSERT', data, attachment);
        } else if (action == 'UPDATE') {
          await featureController.dataChangeCreate(config.profile.id, table_watch, 'UPDATE', data, attachment);
        } else if (action == 'DELETE') {
          await featureController.dataChangeCreate(config.profile.id, table_watch, 'DELETE', data, attachment);
        } else if (action == 'SOFDEL') {
          await featureController.dataChangeCreate(config.profile.id, table_watch, 'SOFDEL', data, attachment);
        } else if (action == 'EDIT') {
          await featureController.dataChangeCreate(config.profile.id, table_watch, 'EDIT', data, attachment);
        } else {
          // pass;
        }
      }
    }

  } catch (err) {
    console.error(err.message);
  }
};