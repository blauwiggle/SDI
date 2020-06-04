import ldap
from pprint import pprint


server_uri = 'ldap://ldap1.mi.hdm-stuttgart.de'
search_base = 'ou=userlist,dc=hdm-stuttgart,dc=de'
search_filter = '(uid=mistudent)'
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
