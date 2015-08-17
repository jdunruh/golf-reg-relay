/* Binary Trees in C */
#include <stdlib.h>
#include <stdio.h>

/* struct for tree node */
struct node {
       struct node *left;
       struct node *right;
       int key;
};


/* test driver */

/* allocate new node and initialize it */
struct node *newnode(key)
     {
     struct node *temp = malloc(sizeof(struct node));
     temp->left = NULL;
     temp->right = NULL;
     temp->key = key;
     return temp;
     }

/* insert a node in the tree. No change if dup key */
struct node *insert(struct node *tree, struct node *newel)
     {
       printf("inserting %d\n", newel->key);
     if(tree == NULL) {
       printf("inserting %d into empty tree\n", newel-> key);
             return newel;
             }
     if(tree-> key == newel->key)
       {
         printf("equal keys\n");
         return tree;
       }
     if(newel->key < tree->key)
            {
              printf("recursing tree left\n");
              tree->left = insert(tree->left, newel);
            }
     else
            {
              printf("recursing tree right\n");
            tree->right = insert(tree->right, newel);
            }
     return tree;
     }

/* delete a key from the tree. No change if not found */
struct node *delete(struct node *tree, int key)
{ /* need to free tree to avoid memory leak */
     if(tree->key == key) {
              if(tree->right == NULL)
                 return(tree->left);
              if(tree->left == NULL)
                 return(tree->right);
              return insert(tree->right, tree->left);
           }
     if(key < tree->key)
          return delete(tree->left, key);
     else
          return delete(tree->left, key);
     }

/* find key. returns node containing key or NULL if not found */
struct node *find(struct node *tree, int key)
       {
       if(tree == NULL || tree->key == key)
               return tree;
       if(tree->key < key)
          find(tree->left, key);
       else
          find(tree->right, key);
       }

void printtree(struct node *tree)
     {
     if(tree == NULL)
             return;
     printf("%d ", tree->key);
     printtree(tree->left);
     printtree(tree->right);
     printf("\n");
     }

/* test driver */
 int main() {
   struct node *new;
   struct node *root;
   root = NULL;

   new = newnode(5);
   root = insert(root, new);
    printtree(root);
   new = newnode(7);
   root = insert(root, new);
   printtree(root);
   new = newnode(3);
   root = insert(root, new);
   new = newnode(9);
   root = insert(root, new);
   new = newnode(8);
   root = insert(root, new);
   new = newnode(2);
   root = insert(root, new);
   new = newnode(4);
   root = insert(root, new);
   printtree(root);
   root = delete(root, 5);
   printtree(root);
   new = find(root, 9);
   printf("%d",new->key);
 }
