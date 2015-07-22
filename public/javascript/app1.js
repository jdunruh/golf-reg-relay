var re = /^flights\[([a-fA-F0-9])+\]/; // $1 is the "index" part of the name
var reAttr = /^(flights\[)[a-fA-F0-9]+(\]\[(.+)\])/; // $1 is the "index" part of the name, $2 is the attribute part of the name
// name format is flights[9][time]

$(document).ready(function() {
    $('.delete-link').each(function(index, el) {
        var link = el.getAttribute('href');
        $(el).after('<form method="post" action="' + link + '" class="delete"></form>');
    });
    $('.delete-link').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        $(e.target).next('form').submit();
        });
    $('.flights').on('click', 'button.edit-delete-flight', function() {
        var flight = $(this).closest('.flight');
        flight.addClass('hidden-flight');
        flight.find('input[type="hidden"]').val("deleted");
    });
    $('.flights').on('click', 'button.new-delete-flight', function() {
        $(this).closest('.flight').remove();
    });

    $('.add-flight').on('click', function(e) {
        e.preventDefault();
        var allFlights = $('.flights .flight');
        var nextIndex = parseInt((allFlights.length === 0) ? 0 : re.exec(allFlights.last()
            .find('input[type="hidden"]:first-of-type').attr('name'))[1], 10) + 1;
        var clone = $('#template .flight').clone();
        clone.find('input').each(function(index, el) {
            var attrName = $(el).attr('name').replace(reAttr, "$1" + nextIndex + "$2");
            $(el).attr('name', attrName)
        });
        clone.find('.new-flag').val("added");
        clone.appendTo('.flights');
    });
 //   $('.datepicker').datepicker();
});

