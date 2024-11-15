
## Personas overview

List all the personas covered in the security model and their descriptions

* Human users
    * Internal business users
       * Sales Director:
       * Account Executive: 
    * Internal admin users
    * External authenticated users
    * External unauthenticated users
      * None 
* Non-human users
    * Integration users
    * System/technical users

```soql
Select Name, Label, Type, LastModifiedDate,Description from PermissionSet
 where IsOwnedByProfile = false and NamespacePrefix=''
 order by LastModifiedDate desc limit 5
```


### Users based on individuals, not personas

 Profiles used for base-level permissions.
Check if your profiles give access to objects or fields through : 


```soql
SELECT Field, PermissionsRead, PermissionsEdit, SobjectType FROM FieldPermissions
  WHERE Parent.Profile.Name = 'System Administrator'
```
> Info: Change `System Administrator` with your profile name

### Permission with with PermissionsModifyAll

```soql
SELECT SObjecttype, Parent.Profile.Name, Parent.Type, Parent.Name,
       Parent.Description, Parent.Profile.Description
  FROM ObjectPermissions
  where PermissionsModifyAllRecords=true
```

## Users

Last connections
```soql
Select Name, Profile.Name,LastLoginDate, UserRole.Name from User
 where LastLoginDate != null order by LastLoginDate desc limit 5 
```

User not connected in the last 180 days
```soql
Select Name, Profile.Name,LastLoginDate, UserRole.Name from User
 where LastLoginDate > LAST_N_DAYS:180
```
