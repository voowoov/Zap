from django import template
from django.utils import timezone
from django.utils.translation import get_language

register = template.Library()

@register.filter
def custom_time_since(value):
    current_language = get_language()
    deltat=(timezone.now()-value).seconds
    if current_language=='en':
        if deltat<7200:
            return str(int(deltat/60)) + " minutes ago"
        if deltat<172800:
            return str(int(deltat/3600)) + " hours ago"
        if deltat<1209600:
            return str(int(deltat/86400)) + " days ago"
        if deltat<5443200:
            return str(int(deltat/604800)) + " weeks ago"
        if deltat<63072000:
            return str(int(deltat/2678400)) + " months ago"
        else:
            return str(int(deltat/31536000)) + " years ago"
    else:
        if deltat<7200:
            return "il y a " + str(int(deltat/60)) + " minutes"
        if deltat<172800:
            return "il y a " + str(int(deltat/3600)) + " heures"
        if deltat<1209600:
            return "il y a " + str(int(deltat/86400)) + " jours"
        if deltat<5443200:
            return "il y a " + str(int(deltat/604800)) + " semaines"
        if deltat<63072000:
            return "il y a " + str(int(deltat/2678400)) + " mois"
        else:
            return "il y a " + str(int(deltat/31536000)) + " années"
    # return value.replace(minute=0, second=0, microsecond=0)
