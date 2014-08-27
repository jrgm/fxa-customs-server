/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint esnext:true*/ // silence const-ant whining

const exec = require('child_process').exec
const fs = require('fs')
const path = require('path')
const util = require('util')

const packageVersion = require('./package.json').version

var P = require('bluebird')

// See if config/version.json exists (part of rpm builds)
var commitHash = (function() {
  var sha
  try {
    sha = require('./config/version.json')
    sha = sha.version.hash
  } catch(e) { /* ignore */ }
  return sha
})()

module.exports = function() {
  var dfd = P.defer()

  if (commitHash) { 
    dfd.resolve({
      version: packageVersion,
      commit: commitHash
    })
  } else {
    var gitDir = path.resolve(__dirname, '.git')
    if (!fs.existsSync(gitDir)) {
      gitDir = path.sep + path.join('home', 'app', 'git')
    }
    var cmd = util.format('git --git-dir=%s rev-parse HEAD', gitDir)

    exec(cmd, function(err, stdout) {
      if (err) { 
        dfd.reject(err)
      } else {
        commitHash = stdout.replace(/\s+/, '')
        dfd.resolve({
          version: packageVersion,
          commit: commitHash,
        })
      }
    })
  }

  return dfd.promise
}
