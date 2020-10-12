// lib_servers.js - 1.85GB

// returns an array of all servers in the game
export const array_get_servers = (ns) => {
  const array_servers = [ns.getHostname()];
  array_servers.forEach(string_server => {
    ns.scan(string_server).forEach(string_scan_result => {
      -1 === array_servers.indexOf(string_scan_result) &&
        array_servers.push(string_scan_result);
    });
  });
  return array_servers;
};