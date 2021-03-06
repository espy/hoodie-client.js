define 'specs/hoodie/config', ['mocks/hoodie', 'hoodie/config'], (HoodieMock, Config) ->
  
  describe "Config", ->  
    beforeEach ->
      @hoodie = new HoodieMock 
      @config = new Config @hoodie
    
    describe ".constructor(@hoodie, options)", ->
      it "should default @type to '$config'", ->
        config = new Config @hoodie 
        expect(config.type).toBe '$config'
        
      it "should default @id to 'hoodie'", ->
        config = new Config @hoodie 
        expect(config.id).toBe 'hoodie'
    # /.constructor(@hoodie, options)
     
    describe ".set(key, value)", ->
      beforeEach ->
        spyOn(@hoodie.store, "update")
      
      it "should save a $config with key: value", ->
        @config.set('funky', 'fresh')
        expect(@hoodie.store.update).wasCalledWith '$config', 'hoodie', {funky: 'fresh'}, silent: false

      it "should make the save silent for local settings starting with _", ->
        @config.set('_local', 'fresh')
        expect(@hoodie.store.update).wasCalledWith '$config', 'hoodie', {_local: 'fresh'}, silent: true
      
    # /.set(key, value)
    
    describe ".get(key)", ->
      beforeEach ->
        spyOn(@hoodie.store, "load").andReturn @hoodie.defer().resolve funky: 'fresh'
        @config = new Config @hoodie
      
      it "should get the config using store", ->
        expect(@config.get('funky')).toBe 'fresh'
    # /.get(key)
    
    describe ".remove(key)", ->
      beforeEach ->
        spyOn(@hoodie.store, "update").andReturn 'promise'
        
      it "should remove the config using store", ->
        @config.remove('funky')
        expect(@hoodie.store.update).wasCalledWith '$config', 'hoodie', {funky: undefined}, silent: false
    # /.remove(key)