/*
 * grunt-import-html
 * https://github.com/sflyphotobooks/grunt-import-html
 *
 * Copyright (c) 2015 Jason Rose
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('import_html', 'The best Grunt plugin ever.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      targetRegex: 'INJECT_HERE'
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join('');

      var srcLines = src.split('\n');
      var entries = [];

      for(var i = 0; i < srcLines.length; i++) {
        var matches = srcLines[i].match(/(src|href)="([^"]*)"/);
        if(matches && matches.length > 1) {
          var type = 'css';
          switch(matches[1]) {
            case 'src':
              type = 'js';
              break;
            case 'href':
              type = 'css';
              break;
          }
          var url = matches[2];
          if(url.search(/staticsfly/) > -1) {
            url = url.substring(url.indexOf('staticsfly.com/') + 'staticsfly.com/'.length);
            entries.push({type: type, server: 'cdn', url: url});
          } else if(url.search(/bower_components/) > -1) {
            entries.push({type: type, server: 'passthrough', url: url});
          } else if(url.search(/shutterfly.com/) > -1) {
            url = url.substring(url.indexOf('shutterfly.com/') + 'shutterfly.com/'.length);
            entries.push({type: type, server: 'www', url: url});
          } else {
            entries.push({type: type, server: 'app', url: url});
          }
        }
      }

      var targetFile = grunt.file.read(f.dest);

      var re = new RegExp(options.targetRegex, 'g');

      var output = targetFile.replace(re, JSON.stringify(entries));

      // Write the destination file.
      grunt.file.write(f.dest, output);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" updated.');
    });
  });

};
