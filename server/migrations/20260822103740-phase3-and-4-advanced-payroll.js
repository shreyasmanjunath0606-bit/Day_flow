'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var Promise;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function(db) {
  var filePath = path.join(__dirname, 'sqls', '20260822103740-phase3-and-4-advanced-payroll-up.sql');
  return new Promise( function( resolve, reject ) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      if (err) return reject(err);
      console.log('received data: ' + data);

      resolve(data);
    });
  })
  .then(function(data) {
    return db.runSql(data);
  })
  .then(function() {
    return db.runSql(`
      CREATE TRIGGER trg_salary_revision
      BEFORE UPDATE ON salary_structures
      FOR EACH ROW
      BEGIN
          IF OLD.basic_salary != NEW.basic_salary OR 
             OLD.hra != NEW.hra OR 
             OLD.da != NEW.da OR 
             OLD.special_allowance != NEW.special_allowance THEN
             
              INSERT INTO salary_revision_history (
                  id, profile_id, old_basic, new_basic, old_gross, new_gross, old_net, new_net, revision_reason, revised_by, effective_from
              ) VALUES (
                  UUID(), OLD.profile_id, OLD.basic_salary, NEW.basic_salary,
                  OLD.gross_salary, (NEW.basic_salary + NEW.hra + NEW.da + NEW.special_allowance),
                  OLD.net_salary, (NEW.basic_salary + NEW.hra + NEW.da + NEW.special_allowance - NEW.pf_deduction - NEW.tax_deduction - NEW.other_deductions),
                  'Automated revision trigger', NEW.updated_by, IFNULL(NEW.effective_from, CURRENT_DATE)
              );
          END IF;
      END
    `);
  });
};

exports.down = function(db) {
  var filePath = path.join(__dirname, 'sqls', '20260822103740-phase3-and-4-advanced-payroll-down.sql');
  return new Promise( function( resolve, reject ) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      if (err) return reject(err);
      console.log('received data: ' + data);

      resolve(data);
    });
  })
  .then(function(data) {
    return db.runSql(data);
  });
};

exports._meta = {
  "version": 1
};
