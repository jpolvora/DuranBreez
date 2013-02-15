using System;
using System.Data.Entity;

namespace DuranBreez.Models {
  public class BreezeSampleDatabaseInitializer :
    // If you prefer to preserve the database between server sessions
    // inherit from DropCreateDatabaseIfModelChanges
    //DropCreateDatabaseIfModelChanges<BreezeSampleContext>

      // When creating the database the first time or 
    // if you prefer to recreate with every new server session
    // inherit from DropCreateDatabaseAlways 
    //DropCreateDatabaseAlways<BreezeSampleContext>
    CreateDatabaseIfNotExists<BreezeSampleContext> {
    protected override void Seed(BreezeSampleContext context) {
      var todos = new[]
                {
                    new TodoItem{Description = "Wake up"},
                    new TodoItem{Description = "Do dishes", IsDone = true},
                    new TodoItem{Description = "Mow lawn", IsDone = true},
                    new TodoItem{Description = "Try Breeze"},
                    new TodoItem{Description = "Tell the world"},
                    new TodoItem{Description = "Go home early"},
                };

      Array.ForEach(todos, t => context.TodoItems.Add(t));

      context.SaveChanges(); // Save 'em
    }
  }
}
