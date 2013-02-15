using System.Data.Entity;

namespace DuranBreez.Models {
    
    public class BreezeSampleContext : DbContext 
    {
        // DEVELOPMENT ONLY: initialize the database
        static BreezeSampleContext()
        {
            Database.SetInitializer(new BreezeSampleDatabaseInitializer());
        }    
        public DbSet<TodoItem> TodoItems { get; set; }
    }
    
}