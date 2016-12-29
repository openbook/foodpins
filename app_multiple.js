/**
 * Created by andybrace on 29/12/2016.
 */
// https://www.npmjs.com/package/node-pinterest
var PDK = require('node-pinterest'),
  pinterest = PDK.init('AZNS7ooV0qSwFiQKP8lcka18bFqJFJTHxkjs4PdDqwEK7-A-BwAAAAA'),
  pins = [],
  boards = [],
  args = process.argv,
  pin_options = {
    qs: {
      fields: "id,link,url,counts,created_at,metadata,note,original_link",
    }
  };



pinterest.api('me/following/boards').then(function(json) {

  json.data.map(function(item,i) {
    boards.push(item);
  });

}).then(function() {

  boards.map(function(board) {

    var url_items = board.url.split("/"),
      board_url_item = url_items.slice(-3),
      board_url = board_url_item.join('/');

    console.log(board_url);

    pinterest.api('boards/' + board_url + 'pins', pin_options)
      .then(function (json) {
        json.data.map(function (item, i) {
          console.log(item.note);
          pins.push(item);
        });

        if (json.page) {
          pinterest.api(json.page.next).then(function (json_next) {
            json_next.data.map(function (item, i) {
              pins.push(item);
            });
          });
        }
      })
  }).then(function(){

    if (args[2].length && args[2] == 'debug') {
      console.log(pins);
    }

    console.log('Boards:');
    boards.map(function (board) {
      console.log(board.name);
    });

    console.log('Total pins found ' + pins.length);

    pins.sort(function (a, b) {
      return b.counts.likes < a.counts.likes;
    });

    if (args[2].length) {

      var searchTerm = args[2];

      console.log('Showing pins where title contains "' + args[2] + '":');

      pins
        .filter(function (pin) {
          return pin.note.toLowerCase()
              .search(searchTerm.toLowerCase()) !== -1;
        })
        .map(function (pin) {
          console.log(pin.note);
          console.log(pin.original_link);
          console.log("Likes: " + pin.counts.likes);
          console.log("Repins: " + pin.counts.repins);
          console.log("\n");
        });
    }
    else {
      pins
        .map(function (pin) {
          console.log(pin.note);
        });
    }

  });

});



var get_boards = new Promise(function(resolve, reject) {
  pinterest.api('me/following/boards').then(function(json) {

    json.data.map(function(item,i) {
      boards.push(item);
    });

  });
});

var get_pins = new Promise(function(resolve, reject) {
  boards.map(function(board) {

    var url_items = board.url.split("/"),
      board_url_item = url_items.slice(-3),
      board_url = board_url_item.join('/');

    console.log(board_url);

    pinterest.api('boards/' + board_url + 'pins', pin_options)
      .then(function (json) {
        json.data.map(function (item, i) {
          console.log(item.note);
          pins.push(item);
        });

        if (json.page) {
          pinterest.api(json.page.next).then(function (json_next) {
            json_next.data.map(function (item, i) {
              pins.push(item);
            });
          });
        }
      })
  });
});

var get_values = new Promise(function(resolve, reject) {
  if (args[2].length && args[2] == 'debug') {
    console.log(pins);
  }

  console.log('Boards:');
  boards.map(function (board) {
    console.log(board.name);
  });

  console.log('Total pins found ' + pins.length);

  pins.sort(function (a, b) {
    return b.counts.likes < a.counts.likes;
  });

  if (args[2].length) {

    var searchTerm = args[2];

    console.log('Showing pins where title contains "' + args[2] + '":');

    pins
      .filter(function (pin) {
        return pin.note.toLowerCase()
            .search(searchTerm.toLowerCase()) !== -1;
      })
      .map(function (pin) {
        console.log(pin.note);
        console.log(pin.original_link);
        console.log("Likes: " + pin.counts.likes);
        console.log("Repins: " + pin.counts.repins);
        console.log("\n");
      });
  }
  else {
    pins
      .map(function (pin) {
        console.log(pin.note);
      });
  }
});

Promise.all([get_boards, get_pins, get_values]).then(function(values) {
  console.log(values); // [3, 1337, "foo"]
});