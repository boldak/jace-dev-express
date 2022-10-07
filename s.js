this.on({
    event:"start-molfar",
    callback: () => {
        console.log("start-molfar")
        
        let view = {
            tagList: selectWidgets("9ttfx19bqzm").getInstance(),
            tagForm: selectWidgets("d8ckunsdkjn"),
            filter: selectWidgets("0egco9ik7iwe")
        }
        
        let controller = {
            
            getPathByTag: tag => {
                let parent = _.find(window.molfar.labels, d => d.id == tag.parent)
                return `${(parent) ? parent.label : ""}/${tag.name}`
            },
            
            getTagByPath: path => _.find(window.molfar.labels, d => d.label == path),
            
            getChildsByTag: tag => {
              let chs = window.molfar.labels.filter( d => d.parent == tag.id)
              return chs.concat( _.flatten(chs.map( d => controller.getChildsByTag(d))))
            },
            
            getTagById: id => _.find(window.molfar.labels, d => d.id == id),
            
            updateTagLabel: tag => {
            
                tag.label = (tag.parent) ? controller.getTagById(tag.parent).label : ""
                tag.label += "/" + tag.name
            
                
            },
            
            updateChildsLabel: tag => {
              let chs = window.molfar.labels.filter( d => d.parent == tag.id)
              console.log(chs)
              chs.forEach( t => {
                  controller.updateTagLabel(t)
                  controller.updateChildsLabel(t)
              })    
            },
            
            updateFilter : () => {
                view.filter.update({
                    data: { 
                        list:window.molfar.labels.map( d => d.label),
                        filter: window.molfar.filter.label || []
                    }
                },
                {
                    override:"options.data"
                })
            },
            
            applyFilter: tags => {
                controller.updateFilter()
                tags = tags || window.molfar.filter.label || []
                if(window.molfar.labels) {
                    let fiteredTags = window.molfar.labels.filter( tag => {
                        return !tags.reduce((f,d) => {
                           return f&&!tag.label.startsWith(d)
                        }, true)
                    })
                    fiteredTags = (fiteredTags.length == 0) ? window.molfar.labels : fiteredTags  
                    view.tagList.setData(fiteredTags)
                }
            },
            
            updateForm: () => {
                    window.molfar.current.label = window.molfar.current.label || 
                        {
                            id: uuid(),
                            name:"",
                            path:""
                        }
                    let parentTag = _.find(window.molfar.labels, d => d.id == window.molfar.current.label.parent)
                    
                    let data = { 
                        tagList:   ["--root--"].concat(window.molfar.labels.map( d => d.label)).filter( d => !d.split("/").filter(t=>t).includes(window.molfar.current.label.name)),
                        label: window.molfar.current.label,
                        parentLabel: (parentTag) ? parentTag.label : ""
                                
                    } 
                    setTimeout(() => {
                        view.tagForm.update({data},{override:"options.data"})    
                    }, 10)
        
            },
            
            applyTag: () => {
                let tag = view.tagForm.getInstance().options.data.label
                let parentLabel = view.tagForm.getInstance().options.data.parentLabel
                tag.parent = _.find(window.molfar.labels, d => d.label == parentLabel)
                tag.parent = (tag.parent) ? tag.parent.id : undefined
                console.log(tag)
                let index = _.findIndex(window.molfar.labels, d => d.id == tag.id)
                if(index >= 0 ){
                    window.molfar.labels[index] = tag
                    controller.updateTagLabel(tag)
                    controller.updateChildsLabel(tag)
                } else {
                    window.molfar.labels.push(tag)
                    controller.updateTagLabel(tag)
                }
                
                window.molfar.current.label = tag
                controller.applyFilter()
                controller.updateForm()
            },
            
            cancelTag: () => {
                let tag = window.molfar.current.label
                tag = _.find(window.molfar.labels, d => d.id == tag.id)
                window.molfar.current.label = _.extend({},tag)
                controller.updateForm()
            },
            
            removeTag: () => {
                let tag = window.molfar.current.label
                let deletation = [tag].concat(controller.getChildsByTag(tag)).map( d => d.label)
                console.log(deletation)
                _.remove(window.molfar.labels, t => deletation.includes(t.label))
                window.molfar.current.label = undefined
                controller.applyFilter()
                controller.updateForm()
            }
        }
        
        
        controller.applyFilter()
        controller.updateForm()
        
        
        this.on({
            event:"select-tag",
            callback: (sender, data) => {
                window.molfar.current.label = _.extend({},_.find(window.molfar.labels, d => d.id == data.data.id))
                console.log(window.molfar.current.label)
                controller.updateForm()
            }
        })
        
        this.on({
            event: "create-label",
            callback: () => {
                window.molfar.current.label = undefined
                controller.updateForm()
            }
            
        })
        
        this.on({
            event: "apply-tag",
            callback: () => {
                controller.applyTag()
            }
        })
        
        this.on({
            event: "cancel-tag",
            callback: () => {
                controller.cancelTag()
            }
        })
        
        this.on({
            event: "remove-tag",
            callback: () => {
                controller.removeTag()
            }
        })
        
        this.on({
        event:"set-filter",
        callback: (sender,data) => {
            data = data || []
            window.molfar.filter.label = data
            controller.applyFilter()    
        }        
    })

    }
})  
