// lib_ls.js - 1.8GB
// build array of files to copy from string_server_source
export const array_get_files_with_string = (
  ns,
  string_server,
  substring
) => {
  const string_type_substring = typeof substring;
  switch (string_type_substring) {
    case "string":
      return ns.ls(string_server, substring);
    case "object":
      return substring.flatMap((string_file) => {
        return array_get_files_with_string(ns, string_server, string_file);
      });
    default:
      const string_message_error = `Invalid input "${substring}" of type ${string_type_substring}.`;
      throw (ns.tprint(`ERROR: ${string_message_error}`), new Error(string_message_error));
  }
};