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

pinterest.api('me/following/boards').then(function (json) {
  json.data.map(function (item, i) {
    boards.push(item.name + '(' + item.url + ')');

    var url_items = item.url.split("/"),
      board_url_item = url_items.slice(-3),
      board_url = board_url_item.join('/');

    pinterest.api('boards/' + board_url + 'pins', pin_options)
      .then(function (json) {
        json.data.map(function (item, i) {
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
      .then(function () {

        if (args[2].length && args[2] == 'debug') {
          console.log(pins);
        }

        console.log('Boards:');
        boards.map(function (board) {
          console.log(board);
        });

        console.log("\n" + 'Total pins found ' + pins.length);

        pins.sort(function (a, b) {
          return b.counts.likes < a.counts.likes;
        });

        if (args[2].length) {

          var searchTerm = args[2];

          console.log('Showing pins where title contains "' + args[2] + '":' + "\n");

          pins
            .filter(function (pin) {
              return pin.note.toLowerCase()
                  .search(searchTerm.toLowerCase()) !== -1;
            })
            .sort(function (a, b) {
              return b.counts.likes < a.counts.likes;
            })
            .map(function (pin) {
              console.log(pin.note);
              console.log(pin.original_link);
              console.log("Likes: " + pin.counts.likes);
              console.log("Repins: " + pin.counts.repins + "\n");
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
});