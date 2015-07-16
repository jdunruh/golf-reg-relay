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
        $(this).closest('.flight').addClass('hidden-flight');
        var name = $(this).find(':input:first-of-type').attr('name');
        var index = re.exec(name)[1];
        $(this).closest('.flight').prepend('<input type="hidden" name="flights[' + index + '][deleted]" value="1"');
    });
    $('.flights').on('click', 'button.new-delete-flight', function() {
        $(this).closest('.flight').remove();
    });

    $('.add-flight').on('click', function(e) {
        e.preventDefault();
        var idx = "_new" + Date.now();
       var clone = $('#template .flight').clone();
        clone.find(':input').each(function(index, el) {
            var attrName = $(el).attr('name').replace(reAttr, "$1idx$2");
            $(el).attr('name', attrName)
        });
        clone.appendTo('.flights');
    });
    $('.datepicker').datepicker();
});

