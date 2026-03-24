namespace Project.Services {

public class UserService : BaseService, IDisposable {
    public Task<string> GetNameAsync(Guid id) {
        return Task.FromResult(id.ToString());
    }

    public string Undocumented(Guid id) {
        return id.ToString();
    }
}

}
