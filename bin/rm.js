/* rm.js - 3.05GB - removes files */

import {
  string_sanitise,
  object_parse_arguments
} from "lib_no_ns.js";
import {
  array_get_servers
} from "lib_servers.js";

// functions
const object_get_constants = () => ({
  object_argument_names: {
    file_regex: {
      short: "f",
      long: "file"
    },
    server_regex: {
      short: "e",
      long: "server"
    },
    help: {
      short: "h",
      long: "help"
    },
  },
});

const void_print_help = (ns) => {
  const object_argument_names = object_get_constants().object_argument_names;
  ns.tprint(
    string_sanitise(`
DESCRIPTION
  Removes all removable files (which excludes currently running scripts, including this one).
  Optionally, removes only files whose names match a given regular expression.
  Optionally, removes only files on servers whose names match a given regular expression.
  Optionally, removes only files whose names match a given regular expression on servers whose names match a given regular expression.

USAGE
  run ${ns.getScriptName()} [FLAGS ...] [OPTIONS ...]

FLAGS
  -${object_argument_names.help.short}, --${object_argument_names.help.long}
    Displays this message then exits.

OPTIONS
  -${object_argument_names.server_regex.short}, --${object_argument_names.server_regex.long} <REGEX>
    REGEX = Regular expression used for server names.

  -${object_argument_names.file_regex.short}, --${object_argument_names.file_regex.long} <REGEX>
    REGEX = Regular expression used for filenames.`
    )
  );
};

const array_get_servers_matching_regexes = (
  ns,
  array_string_server_regexes
) => {
  if (array_string_server_regexes.length > 0) {
    const
      array_server_regexes = [],
      array_servers_matching_regexes = [];
    array_string_server_regexes.forEach(string_server_regex => {
      array_server_regexes.push(new RegExp(string_server_regex));
    });
    array_get_servers(ns).forEach(string_server => {
      array_server_regexes.forEach(object_server_regex => {
        object_server_regex.test(string_server) &&
          array_servers_matching_regexes.push(string_server);
      });
    });
    return array_servers_matching_regexes;
  } else {
    return array_get_servers(ns);
  }
};

const array_get_files_on_server_matching_regexes = (
  ns,
  string_server,
  array_string_file_regexes
) => {
  if (array_string_file_regexes.length > 0) {
    const
      array_file_regexes = [],
      array_files_matching_regexes = [];
    array_string_file_regexes.forEach(string_file_regex => {
      array_file_regexes.push(new RegExp(string_file_regex));
    });
    ns.ls(string_server).forEach(string_file => {
      array_file_regexes.forEach(object_file_regex => {
        object_file_regex.test(string_file) &&
          array_files_matching_regexes.push(string_file);
      });
    });
    return array_files_matching_regexes;
  } else {
    return ns.ls(string_server);
  }
};

const void_remove = (
  ns,
  array_string_server_regexes,
  array_string_file_regexes
) => {
  const array_servers = array_get_servers_matching_regexes(
    ns,
    array_string_server_regexes
  );
  array_servers.forEach(string_server => {
    const array_files = array_get_files_on_server_matching_regexes(
      ns,
      string_server,
      array_string_file_regexes
    );
    array_files.forEach(string_file => {
      if (!ns.rm(
        string_file,
        string_server
      )) {
        ns.tprint(
          `WARNING: Unable to remove file "${string_file}" from server "${string_server}".`
        );
      }
    });
  });
};

// main
export const main = async (ns) => {
  // variables
  let boolean_print_help = !1;
  const
    array_server_regexes = [],
    array_file_regexes = [],
    object_arguments = object_parse_arguments(ns.args),
    object_argument_names = object_get_constants().object_argument_names;
  // argument parsing
  for (const string_argument in object_arguments)
    if (object_arguments.hasOwnProperty(string_argument)) {
      const argument_value = object_arguments[string_argument];
      switch (string_argument) {
        case object_argument_names.server_regex.short:
        // fall-through
        case object_argument_names.server_regex.long:
          "object" == typeof argument_value
            ? array_server_regexes.push(...argument_value)
            : array_server_regexes.push(argument_value);
          break;
        case object_argument_names.file_regex.short:
        // fall-through
        case object_argument_names.file_regex.long:
          "object" == typeof argument_value
            ? array_file_regexes.push(...argument_value)
            : array_file_regexes.push(argument_value);
          break;
        case object_argument_names.help.short:
        // fall-through
        case object_argument_names.help.long:
          boolean_print_help = argument_value;
          break;
        case "_":
          continue;
        default:
          const string_message_error = `Unknown argument passed: \"${string_argument}\".`;
          ns.tprint(`ERROR: ${string_message_error}`);
          throw new Error(string_message_error);
      }
    }

  // main
  if (boolean_print_help)
    return void_print_help(ns);
  void_remove(ns, array_server_regexes, array_file_regexes);
};