import { Module } from '@nestjs/common';<% if (controllers && controllers.length) { %><% controllers.forEach(function(controller) { %>
import { <%= controller %> } from './<%= dasherize(controller.replace('Controller', '')) %>.controller';<% }); %><% } %><% if (services && services.length) { %><% services.forEach(function(service) { %>
import { <%= service %> } from './<%= dasherize(service.replace('Service', '')) %>.service';<% }); %><% } %>

@Module({
    imports: [],<% if (controllers && controllers.length) { %>
    controllers: [<% controllers.forEach(function(controller, index) { %><%= controller %><% if (index < controllers.length - 1) { %>, <% } %><% }); %>],<% } %><% if (services && services.length) { %>
    providers: [<% services.forEach(function(service, index) { %><%= service %><% if (index < services.length - 1) { %>, <% } %><% }); %>],
    exports: [<% services.forEach(function(service, index) { %><%= service %><% if (index < services.length - 1) { %>, <% } %><% }); %>],<% } %>
})
export class <%= classify(name) %>Module {}
    