import ldap
from pprint import pprint


server_uri = 'ldap://sdi8b.mi.hdm-stuttgart.de'
search_base = 'ou=devel,ou=software,ou=departments,dc=betrayer,dc=com'
search_filter = '(uid=bean)'
attrs = ['*']

connection = ldap.initialize(server_uri)
connection.simple_bind_s()
results = connection.search_s(
    search_base,
    ldap.SCOPE_ONELEVEL,
    search_filter,
    attrs,
)
connection.unbind()
pprint(results)
