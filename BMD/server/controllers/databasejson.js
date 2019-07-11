module.exports.data = function(rawdata, lobject, callback) {
  //return callback(false);
  var arr = [];
  //console.log(lobject);
  if(!rawdata.total_rows) {
    return callback(false);
  }
  for(var i=0; i<rawdata.total_rows;i++) {
    arr.push(rawdata.rows[i].doc);
    if(i==rawdata.total_rows-1) {
      var specific = arr.filter(function(item) {
        return (
          item.appreciated_user == lobject.appreciated_user &&
          item.client == lobject.client &&
          item.date == lobject.date &&
          (!lobject.ticketno || item.ticketno == lobject.ticketno) &&
          item.type == lobject.type &&
          (!lobject.id || item._id!=lobject.id)
        );
      })
      return callback(specific.length?true:false);
    }
  }
}


module.exports.parachute = function(rawdata, lobject, callback) {
  if(!rawdata.total_rows) {
    return callback(false);
  }
  var arr = [];
  for(var i=0;i<rawdata.total_rows;i++) {
    arr.push(rawdata.rows[i].doc);
    if(i==rawdata.total_rows-1) {
      var specific = arr.filter(function(item) {
        return (
          item.par_name == lobject.par_name &&
          item.ldap_name == lobject.ldap_name &&
          item.intranet_id == lobject.intranet_id
        );
      })
      return callback(specific.length?true:false);
    }
  }
}
