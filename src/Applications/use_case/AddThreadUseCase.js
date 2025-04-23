const CreateThread = require('../../Domains/threads/entities/CreateThread');

class AddThreadUseCase {
    constructor({ threadRepository, userRepository}) {
        this._threadRepository = threadRepository;
        this._userRepository = userRepository;
    }

    async execute(useCasePayload, userId) {
        const createThread = new CreateThread(useCasePayload);
        let user = await this._userRepository.getUserById(userId);
        return this._threadRepository.addThread(createThread, user)
    }
}

module.exports = AddThreadUseCase;