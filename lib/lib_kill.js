// lib_kill.js - 2.3GB
// kills running instances of the named script on a named server
export const void_kill_script_named_server_named = function (
  ns,
  string_server,
  string_script
) {
  const
    array_scripts_running = ns.ps(string_server),
    array_scripts_running_length = array_scripts_running.length;
  for (
    let integer_indices_0 = 0;
    integer_indices_0 < array_scripts_running_length;
    ++integer_indices_0
  ) {
    const
      object_script = array_scripts_running[integer_indices_0],
      string_script_running = object_script.filename;
    string_script_running === string_script &&
      ns.kill(string_script_running, string_server, ...object_script.args);
  }
};