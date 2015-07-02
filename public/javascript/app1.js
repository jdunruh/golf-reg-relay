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
});